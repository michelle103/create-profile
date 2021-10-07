const mongoose = require('mongoose')
const { Schema } = mongoose
const validator = require('validator')
const bcrypt = require('bcryptjs')

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error('Email is invalid!')
        }
      },
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    photo: {
      type: Buffer,
    },
  },
  {
    timestamps: true,
  }
)

// userSchema.statics.findByCredentials = async (email, password) => {
//   const user = await User.findOne({ email })

//   if (!user) {
//     throw new Error('Unable to login!')
//   }

//   const isMatch = await bcrypt.compare(password, user.password)

//   if (!isMatch) {
//     throw new Error('Unable to login!')
//   }

//   return user
// }

userSchema.pre('save', async function (next) {
  const user = this

  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8)
  }

  next()
})

const User = mongoose.model('User', userSchema)

module.exports = User
