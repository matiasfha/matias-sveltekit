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

const i18nItem = S.listItem()
  .title(`i18n Settings`)
  .child(
    S.documentList()
      .title(`i18n Settings`)
      .schemaType('i18n')
      .filter('_type == "i18n" && __i18n_lang == "en"')
      .canHandleIntent(S.documentTypeList('i18n').getCanHandleIntent())
  )

export default () =>
  S.list()
    .title('Base')
    .items([
      i18nItem,
      ...S.documentTypeListItems().filter(listItem => !['i18n'].includes(listItem.getId())),
      
    ])