import React from 'react'
import Form from '../components/login/Form'
import Questions from '../components/login/Questions'

function login() {
  return (
    <div className="w-full max-w-md">
        <Form/>
        <Questions/>
    </div>
  )
}

export default login