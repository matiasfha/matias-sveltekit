import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { deskTool } from 'sanity/desk'
import deskStructure from "./deskStructure";
import schemas from './schemas/schema'
import { codeInput } from '@sanity/code-input'
import { markdownSchema } from "sanity-plugin-markdown";
import { documentI18n } from '@sanity/document-internationalization'
import { table } from '@sanity/table';

export default defineConfig({
    title: "Matias Hernandez",
    projectId: "cyypawp1",
    dataset: "production",
    plugins: [
        deskTool({
            structure: deskStructure
        }),
        visionTool(),
        // "mdide",
        table(),
        documentI18n({
            "base": "en-us",
            "languages": [
                {
                    "title": "English (US)",
                    "id": "en-us"
                },
                {
                    "title": "Dutch (NL)",
                    "id": "nl-nl"
                }
            ],
        }),
        markdownSchema(),
        codeInput()
    ],
    tools: (prev) => {
        if (import.meta.env.DEV) {
            return prev
        }
        return prev.filter(tool => tool.name !== 'vision')
    },
    schema: {
        types: schemas
    }
});
