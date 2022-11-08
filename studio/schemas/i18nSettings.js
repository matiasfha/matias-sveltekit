export default {
    type: 'document',
    title: '18n settings',
    name: 'i18n',
    i18n: true,
    fields: [
        {
            title: 'Id',
            name: 'id',
            type: 'string'
        },
        {
            title: 'Strings',
            name: 'string',
            type: 'array',
            of: [{
                title: 'Objects',
                type: 'object',
                fields: [
                    {
                        title: 'ID',
                        name: 'id',
                        type: 'string'
                    },
                    {
                        title: 'Text',
                        name: 'text',
                        type: 'string'
                    }
                ]
            }],
          },
      ]
}