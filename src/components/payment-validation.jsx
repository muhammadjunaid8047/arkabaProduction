"use client"

import { useState, useEffect } from "react"
import { useStripe, useElements, CardNumberElement, CardExpiryElement, CardCvcElement } from "@stripe/react-stripe-js"

export default function PaymentValidation({ onValidationChange }) {
  const stripe = useStripe()
  const elements = useElements()
  const [errors, setErrors] = useState([])
  const [cardComplete, setCardComplete] = useState({
    cardNumber: false,
    cardExpiry: false,
    cardCvc: false,
  })

  useEffect(() => {
    if (!elements) return

    const cardNumber = elements.getElement(CardNumberElement)
    const cardExpiry = elements.getElement(CardExpiryElement)
    const cardCvc = elements.getElement(CardCvcElement)

    const handleChange = (event, field) => {
      setCardComplete((prev) => ({
        ...prev,
        [field]: event.complete,
      }))

      const newErrors = [...errors]
      const errorIndex = newErrors.findIndex((error) => error.includes(field))

      if (event.error) {
        const errorMessage = getFieldErrorMessage(event.error, field)
        if (errorIndex >= 0) {
          newErrors[errorIndex] = errorMessage
        } else {
          newErrors.push(errorMessage)
        }
      } else if (errorIndex >= 0) {
        newErrors.splice(errorIndex, 1)
      }

      setErrors(newErrors)

      const isValid =
        Object.values({
          ...cardComplete,
          [field]: event.complete,
        }).every(Boolean) && newErrors.length === 0

      onValidationChange(isValid, newErrors)
    }

    cardNumber?.on("change", (event) => handleChange(event, "cardNumber"))
    cardExpiry?.on("change", (event) => handleChange(event, "cardExpiry"))
    cardCvc?.on("change", (event) => handleChange(event, "cardCvc"))

    return () => {
      cardNumber?.off("change")
      cardExpiry?.off("change")
      cardCvc?.off("change")
    }
  }, [elements, errors, cardComplete, onValidationChange])

  const getFieldErrorMessage = (error, field) => {
    const fieldNames = {
      cardNumber: "card number",
      cardExpiry: "expiration date",
      cardCvc: "security code",
    }

    switch (error.code) {
      case "incomplete_number":
        return `Please enter a complete ${fieldNames[field]}.`
      case "invalid_number":
        return `The ${fieldNames[field]} is invalid.`
      case "incomplete_expiry":
        return `Please enter a complete ${fieldNames[field]}.`
      case "invalid_expiry_month":
        return "The expiration month is invalid."
      case "invalid_expiry_year":
        return "The expiration year is invalid."
      case "invalid_expiry_year_past":
        return "The expiration year is in the past."
      case "incomplete_cvc":
        return `Please enter a complete ${fieldNames[field]}.`
      case "invalid_cvc":
        return `The ${fieldNames[field]} is invalid.`
      default:
        return error.message || `Please check your ${fieldNames[field]}.`
    }
  }

  return (
    <div>
      {errors.length > 0 && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
          {errors.map((error, index) => (
            <p key={index} className="text-red-600 text-sm">
              {error}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}
