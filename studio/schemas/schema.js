// First, we must import the schema creator
import createSchema from 'part:@sanity/base/schema-creator'

// Then import schema types from any plugins that might expose them
import schemaTypes from 'all:part:@sanity/base/schema-type'

// Then we give our schema to the builder and provide the result to Sanity
export default createSchema({
  // We name our schema
  name: 'default',
  // Then proceed to concatenate our document type
  // to the ones provided by any plugins that are installed
  types: schemaTypes.concat([
    {
      title: 'External Articles',
      name:  'external-articles',
      type: 'document',
      fields: [
        {
          title: 'Title',
          name: 'title',
          type: 'string'
        },
        {
          title: 'URL',
          name: 'url',
          type: 'string'
        },
        {
          title: 'Image',
          name: 'image',
          type: 'image'
        },
        {
          title: 'Published',
          name: 'published_at',
          type: 'datetime' 
        },
        {
          title: 'Tag',
          name: 'tag',
          type: 'string' 
        }
     
     ]
    }
  ]),
})
