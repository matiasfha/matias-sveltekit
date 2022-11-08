// First, we must import the schema creator
import createSchema from 'part:@sanity/base/schema-creator'

// Then import schema types from any plugins that might expose them
import schemaTypes from 'all:part:@sanity/base/schema-type'

// import models
import favorites from './favorites'
import externalArticles from './externalArticles'
import newsletterCourses from './newsletterCourses'
import post from './post'
import courses from './courses'
import pages from './pages'
import pricing from './pricing'
import buymeacoffee from './buymeacoffee'
import i18n from './i18nSettings'
// Then we give our schema to the builder and provide the result to Sanity
export default createSchema({
  // We name our schema
  name: 'default',
  // Then proceed to concatenate our document type
  // to the ones provided by any plugins that are installed
  types: schemaTypes.concat([
    favorites,
    externalArticles,
    newsletterCourses,
    courses,
    post, 
    pages,
    pricing,
    buymeacoffee,
    i18n
  ]),
})
