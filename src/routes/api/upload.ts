import { existsSync } from "node:fs"
import { mkdir, writeFile } from "node:fs/promises"
import { join } from "node:path"
import { createFileRoute } from "@tanstack/react-router"
import sharp from "sharp"
import { v4 as uuidv4 } from "uuid"

export const Route = createFileRoute("/api/upload")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          // read data from request
          const formData = await request.formData()
          // extreact it from formData
          const file = formData.get("file") as File | null
          // validate the image
          if (!file) {
            return new Response(JSON.stringify({ error: "No file provided" }), {
              status: 400,
            })
          }
          // convert the file to buffer for processing
          const bytes = await file.arrayBuffer()
          const buffer = Buffer.from(bytes)
          // setup update directory
          const uploadDir = join(process.cwd(), "public", "uploads")
          if (!existsSync(uploadDir)) {
            await mkdir(uploadDir, { recursive: true })
          }
          // renaming the file
          const uuid = uuidv4()
          const fileName = `${uuid}.webp`
          // recreate the path directory
          const filePath = join(uploadDir, fileName)
          // process: compress the image file
          const compressedBuffer = await sharp(buffer)
            .resize({ height: 500 })
            .webp({ quality: 80 })
            .toBuffer()
          // write the processed image to the file system
          await writeFile(filePath, compressedBuffer)
          // return the directory path
          return new Response(JSON.stringify({ url: `/uploads/${fileName}` }))
        } catch (_error) {
          // return error if failed
          return new Response(JSON.stringify({ error: "Upload failed" }), {
            status: 500,
          })
        }
      },
    },
  },
})
