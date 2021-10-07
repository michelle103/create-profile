require('./db/mongoose')
const express = require('express')
const app = express()
const port = process.env.PORT || 3000
const User = require('./models/user')
const session = require('express-session')
const MongoStore = require('connect-mongo')
const bcrypt = require('bcryptjs')

app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))

app.use(
  session({
    name: 'user_sid',
    resave: false,
    saveUninitialized: false,
    secret: 'some secret key',
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URL,
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
      sameSite: true,
      secure: false,
    },
  })
)

const isAuth = (req, res, next) => {
  if (req.session.userId) {
    next()
  } else {
    res.redirect('/')
  }
}

const redirectProfile = (req, res, next) => {
  if (req.session.userId) {
    res.redirect('/profile')
  } else {
    next()
  }
}

app.set('view engine', 'ejs')

app.get('/', redirectProfile, (req, res) => {
  res.render('index', { error: false })
})

app.post('/', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email })

    if (!user) {
      return res.render('index', { error: 'Unable to login!' })
    }

    const isMatch = await bcrypt.compare(req.body.password, user.password)

    if (!isMatch) {
      return res.render('index', { error: 'Unable to login!' })
    }

    req.session.userId = user._id

    res.redirect('/profile')
  } catch (e) {
    res.status(400).send(e.message)
  }
})

app.get('/signup', redirectProfile, (req, res) => {
  res.render('signup', { error: false })
})

app.post('/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body

    const exists = await User.findOne({ email })

    if (exists) {
      return res.render('signup', { error: 'Email is already in use!' })
    }

    const hashedPassword = await bcrypt.hash(password, 8)

    const user = new User({
      username,
      email,
      password: hashedPassword,
    })

    await user.save()
    res.render('index', { error: false })
  } catch (e) {
    res.status(400).send(e.message)
  }
})

app.get('/profile', isAuth, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId)

    res.render('profile', {
      username: user.username,
    })
  } catch (e) {
    res.send(e.message)
  }
})

app.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      res.redirect('/profile')
    }
  })

  res.clearCookie('user_sid')
  res.redirect('/')
})

app.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})
