var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
var middleware = require("../middleware");

//INDEX route - show all campgrounds
router.get("/", function(req, res) {
    //get all campgrounds from DB
    Campground.find({}, function(err, allCampgrounds) {
        if (err) {
            console.log(err);
        } else {
            res.render("campgrounds/index", { campgrounds: allCampgrounds, currentUser: req.user, page: "campgrounds" });
        }
    });
});

//NEW route - show form to create a new cmpgrnd
router.get("/new", middleware.isLoggedIn, function(req, res) {
    res.render("campgrounds/new");
});

//Route NEW must be before SHOW in the code because if it was after it would always go and get show route!!

//SHOW route - shows info about one object
router.get("/:id", function(req, res) {
    //find the campground with provided ID
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground) {
        if (err || !foundCampground) {
            req.flash("error", "Campground not found");
            res.redirect("back");
        } else {
            console.log(foundCampground)
                //render show template with that campground
            res.render("campgrounds/show", { campground: foundCampground })
        }
    });
});

//CREATE route - add new cmpgrnd to DB
router.post("/", middleware.isLoggedIn, function(req, res) {
    //get data from form and add to campgrnds array
    var name = req.body.name;
    var price = req.body.price;
    var image = req.body.image;
    var desc = req.body.description;
    var author = {
        id: req.user._id,
        username: req.user.username
    };
    var newCampground = { name: name, price: price, image: image, description: desc, author: author }
        //Create a new campground and save to DB
    Campground.create(newCampground, function(err, newlyCreated) {
        if (err) {
            console.log(err);
        } else {
            //redirect back to cmpgrnds
            console.log(newlyCreated)
            res.redirect("/campgrounds");
        }
    })
});

//EDIT route
router.get("/:id/edit", middleware.checkCampgroundOwner, function(req, res) {
    Campground.findById(req.params.id, function(err, foundCampground) {
        res.render("campgrounds/edit", { campground: foundCampground });
    });
});
//UPDATE route
router.put("/:id", middleware.checkCampgroundOwner, function(req, res) {
        //find and update the correct campgrnd
        Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground) {
            if (err) {
                res.redirect("/campgrounds");
            } else {
                //redirect somewhere
                res.redirect("/campgrounds/" + req.params.id);
            }
        })
    })
    //DESTROY route
router.delete("/:id", middleware.checkCampgroundOwner, function(req, res) {
    Campground.findByIdAndRemove(req.params.id, function(err) {
        if (err) {
            res.redirect("/campgrounds");
        }
        req.flash("success", "Campground deleted successfully!");
        res.redirect("/campgrounds");
    });
});


module.exports = router;