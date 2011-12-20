var Response = require("ringo/webapp/response").Response;
var Request = require("ringo/webapp/request").Request;
var auth = require("../auth");

exports.app = function(req) {
    var request = new Request(req);
    var details = auth.authenticate(request);
    var response = new Response();
    response.setHeader("Set-Cookie",details.token + ";Path=/");
    response.render(module.resolve("../templates/composer.html"), {status: details.status || 404});
    return response;
};
