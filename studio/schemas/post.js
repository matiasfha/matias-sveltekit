export default {
  title: "Posts",
  name: "posts",
  type: "document",
  fields: [
    {
      title: "Title",
      name: "title",
      type: "string",
      validation: (Rule) => Rule.required(),
    },
    {
      title: "Date",
      name: "date",
      type: "date",
      options: {
        dateFormat: "YYYY-MM-DD",
        calendarTodayLabel: "Today",
      },
      validation: (Rule) => Rule.required(),
    },
    {
      title: "Cover Image",
      name: "banner",
      type: "image",
      fields: [
        {
          // Editing this field will be hidden behind an "Edit"-button
          name: "bannerCredit",
          type: "string",
          title: "Attribution",
        },
      ],
      validation: (Rule) => Rule.required(),
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
      title: "Summary",
      name: "description",
      type: "text",
      validation: (Rule) => Rule.required(),
    },
    {
      title: "Content",
      name: "content",
      type: "markdown",

      validation: (Rule) => Rule.required(),
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
