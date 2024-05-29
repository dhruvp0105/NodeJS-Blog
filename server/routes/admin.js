const express = require('express');
const post = require('../models/post');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const router = express.Router();
const jwt = require('jsonwebtoken')

const adminLayout = '../views/layouts/admin'
const jwtSecret = process.env.JWT_SECRET

router.get('/admin', async (req, res) => {

    try {
        const locals = {
            title: "NodeJS Blog",
            description: "Simple Blog created with nodeJS, Express & MongoDB."
        }
        const data = await post.find();
        res.render('admin/index', { locals, layout: adminLayout });
    }
    catch (error) {
        console.log(error);
    }
})

// Admin - check login
router.post('/admin', async (req, res) => {

    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username })
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' })
        }

        const isPasswordValid = await bcrypt.compare(password, user.password)
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials' })
        }
        const token = jwt.sign({ userId: user._id }, jwtSecret);
        res.cookie('authToken', token, { httpOnly: true })
        res.redirect('/dashboard')
    }
    catch (error) {
        console.log(error);
    }
})

const authMiddleware = (req, res, next) => {
    const token = req.cookies.authToken;
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    try {
        const decoded = jwt.verify(token, jwtSecret)
        req.userId = decoded.userId;
        next();
    }
    catch (error) {
        console.log(error);
    }
}

router.get('/dashboard', authMiddleware, async (req, res) => {
    try {
        const locals = {
            title: "NodeJS Blog",
            description: "Simple Blog created with nodeJS, Express & MongoDB."
        }
        const data = await post.find();
        res.render('admin/dashboard', { locals, data, layout: adminLayout });
    }
    catch (error) {
        console.log(error);
    }
})

// Admin - Register
router.post('/register', async (req, res) => {

    try {
        const { username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        try {
            const user = await User.create({ username, password: hashedPassword });
            res.status(201).json({ message: "User created", user });
        }
        catch (error) {
            if (error.code === 11000) {
                res.status(409).json({ message: "User already in use" })
            }
            res.status(500).json({ message: "Internal server error" })
        }

    }
    catch (error) {
        console.log(error);
    }
})

// Admin - create a new post
router.get('/add-post', authMiddleware, async (req, res) => {
    try {
        const locals = {
            title: "Add Post",
            description: "Simple Blog created with nodeJS, Express & MongoDB."
        }
        res.render('admin/add-post', { locals, layout: adminLayout })
    }
    catch (error) {
        console.log(error);
    }
})

router.post('/add-post', authMiddleware, async (req, res) => {
    try {
        const newPost = new post({
            title: req.body.title,
            body: req.body.body
        })

        await post.create(newPost)
        res.redirect('/dashboard')
    }
    catch (error) {
        console.log(error);
    }
})

router.put('/edit-post/:id', authMiddleware, async (req, res) => {
    try {
        await post.findByIdAndUpdate(req.params.id, {
            title: req.body.title,
            body: req.body.body,
            updatedAt: Date.now()
        })
        res.redirect(`/edit-post/${req.params.id}`)
    }
    catch (error) {
        console.log(error);
    }
})

router.get('/edit-post/:id', authMiddleware, async (req, res) => {
    try {
        const locals = {
            title: "Edit Post",
            description: "Simple Blog created with nodeJS, Express & MongoDB."
        }
        const data = await post.findOne({ _id: req.params.id })
        res.render('admin/edit-post', {
            data, locals, layout: adminLayout
        })
    }
    catch (error) {
        console.log(error);
    }
})

router.delete('/delete-post/:id', authMiddleware, async (req, res) => {
    try {
        await post.deleteOne({ _id: req.params.id })
        res.redirect('/dashboard')
    } catch (error) {
        console.log(error);
    }
})

router.get('/logout', (req, res) => {
    res.clearCookie('authToken')
    res.redirect('/')
})

module.exports = router;