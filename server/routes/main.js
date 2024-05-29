const express = require('express');
const post = require('../models/post');
const router = express.Router();

router.get('/', async (req, res) => {
    const locals = {
        title: "NodeJS Blog",
        description: "Simple Blog created with nodeJS, Express & MongoDB."
    }

    try {

        let perPage = 6;
        let page = req.query.page || 1;
        const data = await post.aggregate([{ $sort: { createdAt: -1 } }]).skip(perPage * page - perPage).limit(perPage).exec();

        const count = await post.countDocuments();
        const nextPage = parseInt(page) + 1;
        const hasNextPage = nextPage <= Math.ceil(count / perPage);

        res.render('index', { locals, data, current: page, nextPage: hasNextPage ? nextPage : null, currentRoute: '/' })
    }
    catch (error) {
        console.log("error", error)
    }

})

router.get('/post/:id', async (req, res) => {
    try {
        let slug = req.params.id;
        const data = await post.findById({ _id: slug });

        const locals = {
            title: data.title,
            description: "Simple Blog created with nodeJS, Express & MongoDB."
        }
        res.render('post', { locals, data, currentRoute: `/post/${slug}` });
    }
    catch (error) {
        console.log(error);
    }
})

router.post('/search', async (req, res) => {
    try {
        const locals = {
            title: "Search",
            description: "Simple Blog created with nodeJS, Express & MongoDB."
        }
        let searchTerm = req.body.searchTerm;
        let searchNoSpecialChar = searchTerm.replace(/[^a-zA-Z0-9]/g, "")
        const data = await post.find({
            $or: [
                { title: { $regex: new RegExp(searchNoSpecialChar, 'i') } },
                { body: { $regex: new RegExp(searchNoSpecialChar, 'i') } },
            ]
        })
        res.render("search", { locals, data });
    }
    catch (error) {
        console.log(error);
    }
})

router.get('/about', (req, res) => {
    res.render('about', { currentRoute: '/about' })
})

module.exports = router