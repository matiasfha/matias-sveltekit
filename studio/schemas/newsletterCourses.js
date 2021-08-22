export default {
    name: 'microbytes',
    title: 'Microbytes Courses',
    type: 'document',
    fields: [
        {
            name: "course",
            type: "string",
            title: "Course Title"
        },
        {
            name: "image",
            type: "image",
            title: "Course Image"
        },
        {
            name: "tagId",
            type: "string",
            title: "Convertkit Id"
        },
        {
            name: "description",
            type: "array",
            of: [{type: 'block'}],
            title: "Description"
        },
    ]
}