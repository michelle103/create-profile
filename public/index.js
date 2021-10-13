const email = document.getElementById('email')
const password = document.getElementById('password')
const username = document.getElementById('username')

function changeIconColor(e) {
  const icon = e.target.previousElementSibling.children[0]
  const input = e.target
  if (e.type === 'focusin') {
    icon.style.color = '#343a40'
    input.style.color = '#343a40'
  } else {
    icon.style.color = '#ced4da'
    input.style.color = '#ced4da'
  }
}

if (username) {
  username.addEventListener('focusin', e => {
    changeIconColor(e)
  })

  username.addEventListener('focusout', e => {
    changeIconColor(e)
  })
}

email.addEventListener('focusin', e => {
  changeIconColor(e)
})

email.addEventListener('focusout', e => {
  changeIconColor(e)
})

password.addEventListener('focusin', e => {
  changeIconColor(e)
})

password.addEventListener('focusout', e => {
  changeIconColor(e)
})
