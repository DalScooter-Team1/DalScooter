import React from 'react'
import Form from '../components/register/Form'
import Questions from '../components/register/Questions'

function register() {
  return (
    <div className="w-full max-w-md">
        <Form/>
        <Questions/>
    </div>
  )
}

export default register