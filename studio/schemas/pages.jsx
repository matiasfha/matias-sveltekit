import React from 'react'
import pricing from './pricing'

const Princing = () => (
  <code>&lt;Pricing Component&gt;</code>
)

const Coffee = () => (
    <code>&lt;Coffee Component&gt;</code>
)


export default {
  name: "page",
  type: "document",
  title: "Page",
  fields: [
    {
      name: "title",
      type: "string",
      title: "Title",
    },
    {
      title: "Keywords",
      name: "keywords",
      type: "array",
      of: [{ type: "string" }],
      options: {
        layout: "tags",
      },
      validation: (Rule) => Rule.required().unique().min(2),
    },
    {
      title: "Description",
      name: "description",
      type: "string",
    },
    {
      title: "Header Image",
      name: "header",
      type: "image",
    },
    {
      name: "content",
      title: "Content",
      type: "markdown",
    },
    {
      name: "text",
      title: "Text",
      type: "array",
      of: [
        { type: "block"},
        {
            type: 'pricing'
        },
        {
            type: 'buymeacoffee'
        },
        {
          type: "image",
          fields: [
            {
              title: "Alt Text",
              name: "alt",
              type: "string",
            },
            {
              title: "Caption",
              name: "caption",
              type: "array",
              of: [{ type: "block" }],
            },
            {
              title: "Title",
              name: "title",
              type: "string",
            },
          ],
        },
        { type: "code" },
        { type: "table" },
        
      ],
      validation: (Rule) => Rule.required(),
    },
    {
      name: "slug",
      title: "Slug",
      type: "string",
    },
    {
      title: "Language",
      name: "language",
      type: "array",
      of: [{ type: "string" }],
      options: {
        list: [
          { title: "English", value: "en" },
          { title: "Español", value: "es" },
        ],
      },
    },
  ],
};
