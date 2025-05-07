import Image from 'next/image'

export default function NotFound() {
    return (
        <div className="w-full min-h-56 text-lg flex items-center justify-center flex-col mt-22">
        <h2 className="text-2xl">404 | Not Found</h2>
        <p className='mt-2'>The page you are looking for does not exist. soz</p>
        <Image
            src="/not-found.png"
            alt="404 Not Found"
            width={500}
            height={500}
            className="mt-4"
        />
        </div>
    )
    }