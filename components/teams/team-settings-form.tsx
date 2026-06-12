"use client";

import { useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { updateTeamSettings } from "@/server/actions/update-team-settings";
import { addTeamPhoto, deleteTeamPhoto } from "@/server/actions/manage-team-photos";
import { upsertTeamSponsor, deleteTeamSponsor } from "@/server/actions/manage-team-sponsors";
import { updatePlayerTeamRole } from "@/server/actions/update-player-team-role";
import { resolveJoinRequest } from "@/server/actions/resolve-join-request";
import { TeamJoinRequest } from "@/server/actions/get-team-join-requests";
import { TeamRole } from "@/lib/permissions";
import { UploadThingImageUploader } from "@/components/players/uploadthing-image-uploader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Check, ImageUp, Info, Instagram, MoreHorizontal, Plus, Shield, Trash2, UserPlus, Users, X } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { TeamHomepageData } from "@/server/actions/get-team-homepage-data";

type Photo = TeamHomepageData["photos"][number];
type Sponsor = TeamHomepageData["sponsors"][number];
type Member = { playerId: number; teamId: number; name: string; imgUrl: string | null; role: TeamRole };

const ROLE_OPTIONS: { value: TeamRole; label: string }[] = [
  { value: "player", label: "Player" },
  { value: "vice_captain", label: "Vice Captain" },
  { value: "treasurer", label: "Treasurer" },
  { value: "secretary", label: "Secretary" },
  { value: "captain", label: "Captain" },
];

const ROLE_HELP: { label: string; desc: string }[] = [
  { label: "Player", desc: "View team data, issue and pay fines, and edit their own profile." },
  { label: "Vice Captain", desc: "Same access as a player." },
  { label: "Treasurer", desc: "Player access plus managing fines and payment records." },
  { label: "Secretary", desc: "Team admin — manage fixtures, fines and players — but cannot edit other players' profiles." },
  { label: "Captain", desc: "Full team management, including member roles and editing or deleting other profiles." },
];

function getInitials(name: string) {
  return name.split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");
}

export function TeamSettingsForm({
  teamId, teamName, initialFinesEnabled, initialLogoUrl, initialDescription, initialInstagramUrl, initialPhotos, initialSponsors, members: initialMembers,
  canManageRoles, joinRequests: initialJoinRequests,
}: {
  teamId: number;
  teamName: string;
  initialFinesEnabled: boolean;
  initialLogoUrl: string | null;
  initialDescription: string | null;
  initialInstagramUrl: string | null;
  initialPhotos: Photo[];
  initialSponsors: Sponsor[];
  members: Member[];
  canManageRoles: boolean;
  joinRequests: TeamJoinRequest[];
}) {
  const [finesEnabled, setFinesEnabled] = useState(initialFinesEnabled);
  const [logoUrl, setLogoUrl] = useState(initialLogoUrl);
  const [description, setDescription] = useState(initialDescription ?? "");
  const [instagramUrl, setInstagramUrl] = useState(initialInstagramUrl ?? "");
  const [savingInstagram, setSavingInstagram] = useState(false);
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos);
  const [sponsors, setSponsors] = useState<Sponsor[]>(initialSponsors);
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [joinRequests, setJoinRequests] = useState<TeamJoinRequest[]>(initialJoinRequests);
  const [resolvingId, setResolvingId] = useState<number | null>(null);
  const [logoDialogOpen, setLogoDialogOpen] = useState(false);
  const [photoDialogOpen, setPhotoDialogOpen] = useState(false);
  const [sponsorDialogOpen, setSponsorDialogOpen] = useState(false);
  const [editingSponsor, setEditingSponsor] = useState<Sponsor | null>(null);
  const [sponsorForm, setSponsorForm] = useState({ name: "", logoUrl: "", websiteUrl: "" });
  const [sponsorLogoDialogOpen, setSponsorLogoDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleFinesToggle = async (value: boolean) => {
    setFinesEnabled(value);
    const result = await updateTeamSettings(teamId, { finesEnabled: value });
    if ("error" in result) { toast.error(result.error); setFinesEnabled(!value); }
    else toast.success(result.success);
  };

  const handleLogoUpload = async (url: string) => {
    setLogoUrl(url);
    setLogoDialogOpen(false);
    const result = await updateTeamSettings(teamId, { logoUrl: url });
    if ("error" in result) toast.error(result.error);
    else toast.success("Logo updated");
  };

  const handleDescriptionSave = async () => {
    setSaving(true);
    const result = await updateTeamSettings(teamId, { description: description || null });
    setSaving(false);
    if ("error" in result) toast.error(result.error);
    else toast.success(result.success);
  };

  const handleInstagramSave = async () => {
    const trimmed = instagramUrl.trim();
    if (trimmed && !/^https?:\/\//i.test(trimmed)) {
      toast.error("Instagram link must start with http:// or https://");
      return;
    }
    setSavingInstagram(true);
    const result = await updateTeamSettings(teamId, { instagramUrl: trimmed || null });
    setSavingInstagram(false);
    if ("error" in result) toast.error(result.error);
    else toast.success(result.success);
  };

  const handlePhotoUpload = async (url: string) => {
    const result = await addTeamPhoto(teamId, url);
    if ("error" in result) { toast.error(result.error); return; }
    setPhotos((prev) => [...prev, { id: Date.now(), url, caption: null, orderIndex: prev.length }]);
    setPhotoDialogOpen(false);
    toast.success("Photo added");
  };

  const handleDeletePhoto = async (photoId: number) => {
    const result = await deleteTeamPhoto(photoId);
    if ("error" in result) { toast.error(result.error); return; }
    setPhotos((prev) => prev.filter((p) => p.id !== photoId));
    toast.success("Photo removed");
  };

  const openAddSponsor = () => {
    setEditingSponsor(null);
    setSponsorForm({ name: "", logoUrl: "", websiteUrl: "" });
    setSponsorDialogOpen(true);
  };

  const openEditSponsor = (s: Sponsor) => {
    setEditingSponsor(s);
    setSponsorForm({ name: s.name, logoUrl: s.logoUrl ?? "", websiteUrl: s.websiteUrl ?? "" });
    setSponsorDialogOpen(true);
  };

  const handleSaveSponsor = async () => {
    if (!sponsorForm.name.trim()) { toast.error("Sponsor name is required"); return; }
    const result = await upsertTeamSponsor(teamId, {
      id: editingSponsor?.id,
      name: sponsorForm.name.trim(),
      logoUrl: sponsorForm.logoUrl || null,
      websiteUrl: sponsorForm.websiteUrl || null,
    });
    if ("error" in result) { toast.error(result.error); return; }
    if (editingSponsor) {
      setSponsors((prev) => prev.map((s) => s.id === editingSponsor.id
        ? { ...s, name: sponsorForm.name, logoUrl: sponsorForm.logoUrl || null, websiteUrl: sponsorForm.websiteUrl || null }
        : s
      ));
    } else {
      setSponsors((prev) => [...prev, { id: Date.now(), name: sponsorForm.name, logoUrl: sponsorForm.logoUrl || null, websiteUrl: sponsorForm.websiteUrl || null, orderIndex: prev.length }]);
    }
    setSponsorDialogOpen(false);
    toast.success(editingSponsor ? "Sponsor updated" : "Sponsor added");
  };

  const handleDeleteSponsor = async (sponsorId: number) => {
    const result = await deleteTeamSponsor(sponsorId);
    if ("error" in result) { toast.error(result.error); return; }
    setSponsors((prev) => prev.filter((s) => s.id !== sponsorId));
    toast.success("Sponsor removed");
  };

  const handleResolveRequest = async (request: TeamJoinRequest, approve: boolean) => {
    setResolvingId(request.id);
    const result = await resolveJoinRequest(request.id, approve);
    setResolvingId(null);
    if ("error" in result) { toast.error(result.error); return; }
    setJoinRequests((prev) => prev.filter((r) => r.id !== request.id));
    if (approve) {
      setMembers((prev) =>
        prev.some((m) => m.playerId === request.playerId)
          ? prev
          : [...prev, { playerId: request.playerId, teamId, name: request.playerName, imgUrl: request.playerImgUrl, role: "player" as TeamRole }]
            .sort((a, b) => a.name.localeCompare(b.name))
      );
    }
    toast.success(result.success);
  };

  return (
    <div className="space-y-6 max-w-xl">
      {/* Identity */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            {logoUrl ? (
              <Image src={logoUrl} alt={teamName} width={56} height={56} unoptimized className="h-14 w-14 rounded-full object-contain border shrink-0" />
            ) : (
              <div className="h-14 w-14 rounded-full border bg-muted flex items-center justify-center text-sm font-semibold shrink-0">
                {getInitials(teamName)}
              </div>
            )}
            <div>
              <CardTitle className="text-xl">{teamName}</CardTitle>
              <CardDescription>Active team</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Dialog open={logoDialogOpen} onOpenChange={setLogoDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5">
                <ImageUp className="h-4 w-4" />{logoUrl ? "Change logo" : "Upload logo"}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Upload team logo</DialogTitle></DialogHeader>
              <UploadThingImageUploader onUploadComplete={handleLogoUpload} />
            </DialogContent>
          </Dialog>

          <div className="space-y-1.5">
            <Label>Team description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A short description of the team for the home page"
              rows={3}
            />
            <Button size="sm" onClick={handleDescriptionSave} disabled={saving}>
              {saving ? "Saving..." : "Save description"}
            </Button>
          </div>

          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5"><Instagram className="h-4 w-4" /> Instagram link</Label>
            <Input
              value={instagramUrl}
              onChange={(e) => setInstagramUrl(e.target.value)}
              placeholder="https://instagram.com/yourteam"
            />
            <p className="text-xs text-muted-foreground">Shown as an Instagram button on the home page when set.</p>
            <Button size="sm" onClick={handleInstagramSave} disabled={savingInstagram}>
              {savingInstagram ? "Saving..." : "Save Instagram link"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Fines toggle */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><Shield className="h-4 w-4" /> Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-lg border px-4 py-3">
            <div>
              <Label htmlFor="fines-toggle" className="font-medium cursor-pointer">Fines</Label>
              <p className="text-xs text-muted-foreground mt-0.5">Allow fines to be issued for this team</p>
            </div>
            <Switch id="fines-toggle" checked={finesEnabled} onCheckedChange={handleFinesToggle} />
          </div>
        </CardContent>
      </Card>

      {/* Photos */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Team Photos</CardTitle>
              <CardDescription>Displayed in the photo grid on the home page</CardDescription>
            </div>
            <Dialog open={photoDialogOpen} onOpenChange={setPhotoDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="gap-1.5"><Plus className="h-4 w-4" /> Add photo</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Upload team photo</DialogTitle></DialogHeader>
                <UploadThingImageUploader onUploadComplete={handlePhotoUpload} />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {photos.length === 0 ? (
            <p className="text-sm text-muted-foreground">No photos yet.</p>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {photos.map((photo) => (
                <div key={photo.id} className="relative aspect-square rounded-lg overflow-hidden group">
                  <Image src={photo.url} alt={photo.caption ?? "Team photo"} fill unoptimized className="object-cover" />
                  <button
                    onClick={() => handleDeletePhoto(photo.id)}
                    className="absolute top-1 right-1 h-6 w-6 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-3 w-3 text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sponsors */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Sponsors</CardTitle>
              <CardDescription>Shown at the bottom of the home page</CardDescription>
            </div>
            <Button size="sm" variant="outline" className="gap-1.5" onClick={openAddSponsor}>
              <Plus className="h-4 w-4" /> Add sponsor
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {sponsors.length === 0 ? (
            <p className="text-sm text-muted-foreground">No sponsors yet.</p>
          ) : (
            <div className="space-y-2">
              {sponsors.map((sponsor) => (
                <div key={sponsor.id} className="flex items-center gap-3 rounded-lg border px-3 py-2">
                  {sponsor.logoUrl ? (
                    <Image src={sponsor.logoUrl} alt={sponsor.name} width={32} height={32} unoptimized className="h-8 w-8 object-contain rounded shrink-0" />
                  ) : (
                    <div className="h-8 w-8 rounded bg-muted flex items-center justify-center text-xs font-semibold shrink-0">{sponsor.name[0]}</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{sponsor.name}</p>
                    {sponsor.websiteUrl && <p className="text-xs text-muted-foreground truncate">{sponsor.websiteUrl}</p>}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0"><MoreHorizontal className="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem className="cursor-pointer" onClick={() => openEditSponsor(sponsor)}>Edit</DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive" onClick={() => handleDeleteSponsor(sponsor.id)}>Remove</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Join requests */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><UserPlus className="h-4 w-4" /> Join Requests</CardTitle>
          <CardDescription>Players who have requested to join this team. Approve to add them.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {joinRequests.length === 0 ? (
            <p className="text-sm text-muted-foreground">No pending requests.</p>
          ) : (
            joinRequests.map((request) => (
              <div key={request.id} className="flex items-center gap-3 rounded-lg border px-3 py-2">
                {request.playerImgUrl ? (
                  <Image src={request.playerImgUrl} alt={request.playerName} width={28} height={28} unoptimized className="h-7 w-7 rounded-full object-cover border shrink-0" />
                ) : (
                  <div className="h-7 w-7 rounded-full border bg-muted flex items-center justify-center text-xs font-semibold shrink-0">{getInitials(request.playerName)}</div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{request.playerName}</p>
                  {request.note && <p className="text-xs text-muted-foreground truncate">{request.note}</p>}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button size="icon" variant="outline" className="h-7 w-7 text-green-600" aria-label="Approve"
                    disabled={resolvingId === request.id} onClick={() => handleResolveRequest(request, true)}>
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="outline" className="h-7 w-7 text-destructive" aria-label="Reject"
                    disabled={resolvingId === request.id} onClick={() => handleResolveRequest(request, false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Member roles */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4" /> Member Roles
            <Popover>
              <PopoverTrigger asChild>
                <button className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Role explanations">
                  <Info className="h-4 w-4" />
                </button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-80">
                <p className="text-sm font-semibold mb-2">What each role can do</p>
                <ul className="space-y-2">
                  {ROLE_HELP.map((r) => (
                    <li key={r.label} className="text-xs">
                      <span className="font-medium text-foreground">{r.label}</span>
                      <span className="text-muted-foreground"> — {r.desc}</span>
                    </li>
                  ))}
                </ul>
              </PopoverContent>
            </Popover>
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            {canManageRoles
              ? "Set who can manage team data. Only captains can change roles."
              : "Only captains can change member roles."}
          </p>
        </CardHeader>
        <CardContent className="space-y-2">
          {members.map((member) => (
            <div key={member.playerId} className="flex items-center justify-between rounded-lg border px-3 py-2">
              <div className="flex items-center gap-2 min-w-0">
                {member.imgUrl ? (
                  <Image src={member.imgUrl} alt={member.name} width={28} height={28} unoptimized className="h-7 w-7 rounded-full object-cover border shrink-0" />
                ) : (
                  <div className="h-7 w-7 rounded-full border bg-muted flex items-center justify-center text-xs font-semibold shrink-0">{member.name[0]}</div>
                )}
                <span className="text-sm font-medium truncate">{member.name}</span>
              </div>
              <select
                value={member.role}
                disabled={!canManageRoles}
                onChange={async (e) => {
                  const newRole = e.target.value as TeamRole;
                  const result = await updatePlayerTeamRole(member.playerId, member.teamId, newRole);
                  if ("error" in result) { toast.error(result.error); return; }
                  setMembers((prev) => prev.map((m) => m.playerId === member.playerId ? { ...m, role: newRole } : m));
                  toast.success(result.success);
                }}
                className="text-xs rounded-md border bg-background px-2 py-1 ml-3 shrink-0 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {ROLE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Sponsor add/edit dialog */}
      <Dialog open={sponsorDialogOpen} onOpenChange={setSponsorDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingSponsor ? "Edit sponsor" : "Add sponsor"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Name *</Label>
              <Input value={sponsorForm.name} onChange={(e) => setSponsorForm((p) => ({ ...p, name: e.target.value }))} placeholder="Sponsor name" />
            </div>
            <div className="space-y-1.5">
              <Label>Website URL</Label>
              <Input value={sponsorForm.websiteUrl} onChange={(e) => setSponsorForm((p) => ({ ...p, websiteUrl: e.target.value }))} placeholder="https://example.com" />
            </div>
            <div className="space-y-1.5">
              <Label>Logo</Label>
              {sponsorForm.logoUrl && (
                <div className="flex items-center gap-2 mb-2">
                  <Image src={sponsorForm.logoUrl} alt="Logo" width={40} height={40} unoptimized className="h-10 w-10 object-contain rounded border" />
                  <button className="text-xs text-muted-foreground hover:text-destructive" onClick={() => setSponsorForm((p) => ({ ...p, logoUrl: "" }))}>Remove</button>
                </div>
              )}
              <Dialog open={sponsorLogoDialogOpen} onOpenChange={setSponsorLogoDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1.5"><ImageUp className="h-4 w-4" />{sponsorForm.logoUrl ? "Change logo" : "Upload logo"}</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Upload sponsor logo</DialogTitle></DialogHeader>
                  <UploadThingImageUploader onUploadComplete={(url) => { setSponsorForm((p) => ({ ...p, logoUrl: url })); setSponsorLogoDialogOpen(false); }} />
                </DialogContent>
              </Dialog>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setSponsorDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSaveSponsor}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
