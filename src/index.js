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
    resave: false,
    saveUninitialized: false,
    secret: 'some secret key',
    store: MongoStore.create({
      mongoUrl: 'mongodb://localhost:27017/profile',
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
      sameSite: true,
      secure: false,
    },
  })
)

const isAuth = (req, res, next) => {
  if (req.session.isAuth) {
    next()
  } else {
    res.redirect('/')
  }
}

app.set('view engine', 'ejs')

app.get('/', (req, res) => {
  res.render('index', { error: false })
})

app.post('/', async (req, res) => {
  try {
    // const user = await User.findByCredentials(req.body.email, req.body.password)
    const user = await User.findOne({ email: req.body.email })

    console.log(user)

    if (!user) {
      return res.render('index', { error: 'Unable to login!' })
    }

    bcrypt
      .compare(req.body.password, user.password)
      .then(result => {
        console.log(result)
        const isMatch = result

        if (!isMatch) {
          return res.render('index', { error: 'Wrong password!' })
        }

        req.session.isAuth = true

        res.render('profile', {
          username: user.username,
        })
      })
      .catch(err => console.log(err))
  } catch (e) {
    res.status(400).send(e.message)
  }
})

app.get('/signup', (req, res) => {
  res.render('signup', { error: false })
})

app.post('/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body

    const exists = await User.findOne({ email })

    if (exists) {
      return res.render('signup', { error: 'Email is already in use!' })
    }

    console.log(password)
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

app.get('/profile', isAuth, (req, res) => {
  res.render('profile')
})

app.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})
