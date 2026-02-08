import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useServerFn } from "@tanstack/react-start"
import { Images, PencilIcon } from "lucide-react"
import { toast } from "sonner"
import type { Category } from "@/modules/categories"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updateCategory } from "@/modules/categories"
import { getDefaultImages } from "@/modules/galleries"

interface CategoryUpdateDialogProps {
  category: Category
}

export function CategoryUpdateDialog({ category }: CategoryUpdateDialogProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState(category.name)
  const [icon, setIcon] = useState(category.icon)
  const [image, setImage] = useState(category.image || "")

  const queryClient = useQueryClient()
  const updateCategoryFn = useServerFn(updateCategory)
  const getDefaultImagesFn = useServerFn(getDefaultImages)

  const { data: defaultImages, isLoading: imagesLoading } = useQuery({
    queryKey: ["default-images"],
    queryFn: () => getDefaultImagesFn(),
    enabled: open,
  })

  const updateMutation = useMutation({
    mutationFn: async () => {
      return await updateCategoryFn({
        data: {
          id: category.id,
          name,
          icon,
          image: image || null,
        },
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] })
      toast.success("success update category")
      setOpen(false)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateMutation.mutate()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="ghost" size="icon" />}>
        <PencilIcon className="h-4 w-4" />
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>
              Update the category details below.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Category name"
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="icon">Icon</Label>
                <Input
                  id="icon"
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  placeholder="Icon name (e.g., Mountain, TreePine)"
                  required
                />
              </div>
            </div>

            <div className="grid gap-2">
              <div className="flex items-center gap-2">
                <Images className="h-4 w-4" />
                <Label>Select Image from Gallery</Label>
              </div>
              {imagesLoading ? (
                <div className="text-muted-foreground text-sm">
                  Loading images...
                </div>
              ) : (
                <div className="max-h-[250px] overflow-y-auto">
                  <div className="grid grid-cols-3 gap-3 rounded-lg border p-3">
                    {defaultImages && defaultImages.length > 0 ? (
                      defaultImages.map((img) => (
                        <button
                          key={img.path}
                          type="button"
                          onClick={() =>
                            setImage(image === img.path ? "" : img.path)
                          }
                          className={`group relative aspect-square overflow-hidden rounded-lg border-2 transition-all hover:scale-105 ${
                            image === img.path
                              ? "border-primary ring-primary/20 ring-2"
                              : "hover:border-muted border-transparent"
                          }`}
                        >
                          <img
                            src={img.path}
                            alt={img.name}
                            className="h-full w-full object-cover"
                          />
                          {image === img.path && (
                            <div className="bg-primary/20 absolute inset-0 flex items-center justify-center">
                              <div className="bg-primary rounded-full p-1 text-white">
                                <svg
                                  className="h-4 w-4"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              </div>
                            </div>
                          )}
                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-1">
                            <p className="text-center text-xs text-white">
                              {img.name}
                            </p>
                          </div>
                        </button>
                      ))
                    ) : (
                      <p className="text-muted-foreground col-span-3 py-8 text-center">
                        No images available in gallery
                      </p>
                    )}
                  </div>
                </div>
              )}

              {image && (
                <div className="mt-2">
                  <p className="text-muted-foreground mb-1 text-sm">
                    Selected:
                  </p>
                  <div>
                    <img
                      src={image}
                      alt="Selected"
                      className="h-50 w-50 w-full rounded-lg object-contain"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                updateMutation.isPending || !name.trim() || !icon.trim()
              }
            >
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
