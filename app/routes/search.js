function SearchHandler(db) {
    "use strict";

    var searchCol = db.collection("search");

    this.search = function(req, res, next) {
        var $where = {}
        if(req.query.search) {
            $where.$where = 'this.name.indexOf("' + req.query.search + '") !== -1 ';
        }
        searchCol.find($where).toArray(function (err, result) {
            if(err) {
                res.send(err.toString());
                return;
            }

            res.render("search", {
                results: JSON.stringify(result, undefined, 2)
            });
        });
    };
}

module.exports = SearchHandler;
