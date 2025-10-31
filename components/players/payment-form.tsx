import {
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { Button } from "../ui/button";
import { createPayment } from "@/server/actions/create-payment";
import { PaymentDrawerProps } from "./pay-drawer";
import { toast } from "sonner";
import { createPaymentIntent } from "@/server/actions/create-payment-intent";
import { motion } from "framer-motion";
import orderConfirmed from "@/public/order-confirmed.json";
import dynamic from "next/dynamic";

const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

export default function Payment({
  amount,
  playerId,
  fineList,
  setOpen,
  sublist
}: PaymentDrawerProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const { execute } = useAction(createPayment, {
    onSuccess: (data) => {
      if (data?.data?.error) {
        toast.error(data.data?.error);
        setErrorMessage(data.data?.error);
        setIsLoading(false);
      }
      if (data?.data?.success) {
        setIsLoading(false);
        toast.success(data.data?.success);
        setIsComplete(true);
      }
    },
    onError: (error) => {
      setIsLoading(false);
      setErrorMessage(`${JSON.stringify(error)} - An error occurred`);
      toast.error(`${JSON.stringify(error)} - An error occurred`);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    if (!stripe || !elements) {
      setIsLoading(false);
      return;
    }
    const { error: submitError } = await elements.submit();

    if (submitError) {
      setErrorMessage(submitError.message!);
      toast.error(errorMessage);
      setIsLoading(false);
      return;
    }

    console.log("Creating payment intent with amount:", amount);

    const data = await createPaymentIntent({
      amount: Math.round(amount * 100), // Convert to cents
      currency: "gbp",
    });

    if (data == undefined) {
      setErrorMessage("Failed to create payment intent. Please try again.");
      toast.error(errorMessage);
      setIsLoading(false);
      return;
    }

    if ("error" in (data?.data ?? {})) {
      setErrorMessage((data.data as { error: string }).error);
      setIsLoading(false);
      toast.error((data.data as { error: string }).error);
      return;
    }

    if (data?.data && "success" in data.data) {
      const successData = (
        data.data as {
          success: {
            paymentIntentID: string;
            clientSecretID: string | null;
            user: string;
          };
        }
      ).success;
      const { error } = await stripe.confirmPayment({
        elements,
        clientSecret: successData.clientSecretID!,
        redirect: "if_required",
        confirmParams: {
          return_url: "http://localhost:3000/success",
          receipt_email: successData.user as string,
        },
      });
      if (error) {
        setErrorMessage(error.message!);
        toast.error(errorMessage);
        setIsLoading(false);
        return;
      } else {
        setIsLoading(false);

        // if execute is sucessful, wait for response and then reload the page
        execute({
          amount: amount,
          playerId: playerId ?? 0,
          paymentMethod: "Stripe",
          paymentType: "Fine",
          paymentStatus: "Completed",
          transactionId: successData.paymentIntentID ?? null,
          fineList: fineList ?? [],
          subList: sublist ?? [],
        });

        setIsComplete(true);
        toast.success("Payment completed successfully!");

        //awit 1sec and then reload the page
        setTimeout(() => {
            setOpen?.(false);
        }, 3000);

        return;

        
      
         
      }
    }
  };

  return (
    <div className="flex items-center justify-center space-x-2 ">
      {isComplete && !errorMessage && (
        <div className="flex flex-col items-center gap-4">
          <div className="text-green-500">Payment completed successfully!</div>
          <motion.div
            animate={{ opacity: 1, scale: 1 }}
            initial={{ opacity: 0, scale: 0 }}
            transition={{ delay: 0.35 }}
          >
            <Lottie className="h-56 my-4" animationData={orderConfirmed} />
          </motion.div>
        </div>
      )}

      {errorMessage && (
        <div className="text-red-500">Error: {errorMessage}</div>
      )}

      {!isComplete && !errorMessage && (
        <form
          onSubmit={handleSubmit}
          className="overflow-x-scroll overflow-y-scroll h-auto"
        >
          <PaymentElement />
          <Button
            className="my-4  w-full h-auto"
            disabled={!stripe || !elements || isLoading}
          >
            {isLoading ? "Processing..." : "Pay now"}
          </Button>
        </form>
      )}
    </div>
  );
}
