# from odoo import http


# class MetaMessaging(http.Controller):
#     @http.route('/meta_messaging/meta_messaging', auth='public')
#     def index(self, **kw):
#         return "Hello, world"

#     @http.route('/meta_messaging/meta_messaging/objects', auth='public')
#     def list(self, **kw):
#         return http.request.render('meta_messaging.listing', {
#             'root': '/meta_messaging/meta_messaging',
#             'objects': http.request.env['meta_messaging.meta_messaging'].search([]),
#         })

#     @http.route('/meta_messaging/meta_messaging/objects/<model("meta_messaging.meta_messaging"):obj>', auth='public')
#     def object(self, obj, **kw):
#         return http.request.render('meta_messaging.object', {
#             'object': obj
#         })

