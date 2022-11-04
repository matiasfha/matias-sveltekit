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
import post from './post'
import markdownPost from './markdownPost'

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
    post, 
  ]),
})
