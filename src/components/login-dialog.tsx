import { useMutation } from "@tanstack/react-query"
import { useState } from "react"
import { GoogleIcon } from "./icon/google-icon"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { authClient } from "@/lib/auth-client"

const LoginDialog = () => {
  const [open, setOpen] = useState(false)

  const googleLoginMutation = useMutation({
    mutationFn: async () => {
      await authClient.signIn.social({
        provider: "google",
      })
    },
    onSuccess: () => {
      setOpen(false)
    },
  })

  const handleGoogleLogin = () => {
    googleLoginMutation.mutate()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            variant="outline"
            className={`flex items-center gap-2 rounded-full`}
          />
        }
      >
        <GoogleIcon width={25} height={25} />
        {/* <User className="text-muted-foreground h-5 w-5" /> */}
        Login With Google
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <DialogTitle className="text-2xl font-bold">
            Welcome to Monq
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Sign in to save your favorite places and leave reviews
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <Button
            variant="outline"
            size="lg"
            onClick={handleGoogleLogin}
            className="flex w-full items-center justify-center gap-3 text-base"
            disabled={googleLoginMutation.isPending}
          >
            <GoogleIcon width={25} height={25} />
            {googleLoginMutation.isPending
              ? "Signing in..."
              : "Continue with Google"}
          </Button>
        </div>
        <p className="text-muted-foreground text-center text-xs">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </DialogContent>
    </Dialog>
  )
}

export default LoginDialog
