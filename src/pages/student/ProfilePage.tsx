import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { useAuth } from "@/context/AuthContext"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input, Label, FieldError } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { apiClient, extractErrorMessage } from "@/lib/apiClient"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { initials } from "@/lib/utils"

interface ProfileValues { full_name: string; phone: string; profile_image_url: string }
interface PasswordValues { old_password: string; new_password: string }

export default function ProfilePage() {
  const { user, refreshMe } = useAuth()
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)

  const profileForm = useForm<ProfileValues>({
    defaultValues: { full_name: user?.full_name || "", phone: user?.phone || "", profile_image_url: user?.profile_image_url || "" },
  })
  const passwordForm = useForm<PasswordValues>()

  async function onSaveProfile(values: ProfileValues) {
    setSavingProfile(true)
    try {
      await apiClient.patch("/auth/me/", values)
      await refreshMe()
      toast.success("Profile updated")
    } catch (err) {
      toast.error(extractErrorMessage(err))
    } finally {
      setSavingProfile(false)
    }
  }

  async function onChangePassword(values: PasswordValues) {
    setSavingPassword(true)
    try {
      await apiClient.post("/auth/change-password/", values)
      toast.success("Password changed")
      passwordForm.reset()
    } catch (err) {
      toast.error(extractErrorMessage(err))
    } finally {
      setSavingPassword(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={user?.profile_image_url} />
          <AvatarFallback className="text-lg">{initials(user?.full_name)}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="font-display text-2xl font-semibold">{user?.full_name}</h1>
          <p className="text-sm text-base-600 dark:text-base-300/60">{user?.email}</p>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle>Profile details</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={profileForm.handleSubmit(onSaveProfile)} className="space-y-4">
            <div>
              <Label htmlFor="full_name">Full name</Label>
              <Input id="full_name" className="mt-1.5" {...profileForm.register("full_name", { required: "Required" })} />
              <FieldError>{profileForm.formState.errors.full_name?.message}</FieldError>
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" className="mt-1.5" {...profileForm.register("phone")} />
            </div>
            <div>
              <Label htmlFor="profile_image_url">Profile image URL</Label>
              <Input id="profile_image_url" className="mt-1.5" {...profileForm.register("profile_image_url")} />
            </div>
            <Button type="submit" disabled={savingProfile}>{savingProfile ? "Saving…" : "Save changes"}</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Change password</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={passwordForm.handleSubmit(onChangePassword)} className="space-y-4">
            <div>
              <Label htmlFor="old_password">Current password</Label>
              <Input id="old_password" type="password" className="mt-1.5" {...passwordForm.register("old_password", { required: "Required" })} />
              <FieldError>{passwordForm.formState.errors.old_password?.message}</FieldError>
            </div>
            <div>
              <Label htmlFor="new_password">New password</Label>
              <Input id="new_password" type="password" className="mt-1.5" {...passwordForm.register("new_password", { required: "Required", minLength: { value: 8, message: "At least 8 characters" } })} />
              <FieldError>{passwordForm.formState.errors.new_password?.message}</FieldError>
            </div>
            <Button type="submit" variant="outline" disabled={savingPassword}>{savingPassword ? "Updating…" : "Update password"}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
