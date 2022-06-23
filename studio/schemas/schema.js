// First, we must import the schema creator
import createSchema from 'part:@sanity/base/schema-creator'

// Then import schema types from any plugins that might expose them
import schemaTypes from 'all:part:@sanity/base/schema-type'

// import models
import siteSettings from './siteSettings'
import favorites from './favorites'
import externalArticles from './externalArticles'
import link from './link'
import navigation from './navigation'
import navItem from './navItem'
import newsletterCourses from './newsletterCourses'

// Then we give our schema to the builder and provide the result to Sanity
export default createSchema({
  // We name our schema
  name: 'default',
  // Then proceed to concatenate our document type
  // to the ones provided by any plugins that are installed
  types: schemaTypes.concat([
    link,
    navItem,
    navigation,
    siteSettings,
    favorites,
    externalArticles,
    newsletterCourses,
    {
      title: 'Page',
      name: 'page',
      type: 'document',
      fields: [
        {
          title: 'Name',
          name: 'name',
          type: 'string'
        },
        {
          title: 'Content',
          name: 'content',
          type: 'array',
          of: [{type: 'block'}]
        },
        {
          name: 'slug',
          title: 'Slug',
          type: 'slug',
          options: {
            source: 'name',
          },
        },
        
      ]
    },
    {
      title: 'Posts',
      name: 'posts',
      type: 'document',
      fields: [
        {
          title: 'Date',
          name: 'date',
          type: 'date',
          options: {
            dateFormat: 'YYYY-MM-DD',
            calendarTodayLabel: 'Today'
          },
          validation: Rule => Rule.required()
        },
        {
          title: 'Cover Image',
          name: 'banner',
          type: 'image',
          fields: [
            {
              // Editing this field will be hidden behind an "Edit"-button
              name: 'bannerCredit',
              type: 'string',
              title: 'Attribution',
            }
          ],
          validation: Rule => Rule.required()
        },
        {
          title: 'Keywords',
          name: 'keywords',
          type: 'array',
          of: [{type: 'string'}],
          options: {
            layout: 'tags'
          },
          validation: Rule => Rule.required().unique().min(2)
        },
        {
          title: 'Title',
          name: 'title',
          type: 'string',
          validation: Rule => Rule.required()
        },
        {
          title: 'Summary',
          name: 'description',
          type: 'text',
          validation: Rule => Rule.required()
        },
        {
          title: 'Content',
          name: 'content',
          type: 'array',
          of: [{type: 'block'}],
          validation: Rule => Rule.required()
        }
      ]

    }
    
  ]),
})
