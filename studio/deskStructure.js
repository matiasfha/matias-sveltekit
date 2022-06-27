// deskStructure.js
import S from '@sanity/desk-tool/structure-builder'
import SocialPreview from 'part:social-preview/component'

export const getDefaultDocumentNode = ({ schemaType }) => {
  // Add the social preview view only to those schema types that support it
  if (['posts'].includes(schemaType)) {
    return S.document().views([
      S.view.form(),
      S.view.component(SocialPreview()).title('Social & SEO'),
    ])
  }
  return S.document().views([S.view.form()])
}


export default () =>
  S.list()
    .title('Base')
    .items([
      S.listItem()
        .title('Settings')
        .child(
          S.document()
            .schemaType('siteSettings')
            .documentId('siteSettings')
        ),
      ...S.documentTypeListItems().filter(listItem => !['siteSettings'].includes(listItem.getId()))
    ])