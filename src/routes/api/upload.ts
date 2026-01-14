import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/upload")({
	server: {
		handlers: {
			POST: async ({ request }) => {
				try {
					const formData = await request.formData();
					const file = formData.get("file") as File | null;
					if (!file) {
						return new Response(JSON.stringify({ error: "No file provided" }), {
							status: 400,
						});
					}

					const bytes = await file.arrayBuffer();
					const buffer = Buffer.from(bytes);

					const uploadDir = join(process.cwd(), "public", "uploads");
					if (!existsSync(uploadDir)) {
						await mkdir(uploadDir, { recursive: true });
					}

					const fileName = `${Date.now()}-${file.name}`;
					const filePath = join(uploadDir, fileName);

					await writeFile(filePath, buffer);

					return new Response(JSON.stringify({ url: `/uploads/${fileName}` }));
				} catch (_error) {
					return new Response(JSON.stringify({ error: "Upload failed" }), {
						status: 500,
					});
				}
			},
		},
	},
});
