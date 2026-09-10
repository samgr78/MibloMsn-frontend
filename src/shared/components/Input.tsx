import type {
  ComponentPropsWithoutRef,
  HTMLInputTypeAttribute,
  ReactElement,
} from 'react'
import { forwardRef } from 'react'

type InputProps = ComponentPropsWithoutRef<'input'> & {
  type?: HTMLInputTypeAttribute
  placeholder?: string
  name?: string
  id?: string
  className?: string
  label: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(function Input({
  type = 'text',
  label,
  placeholder,
  name,
  id,
  className,
  ...props
}: InputProps, ref): ReactElement {
  return (
    <label>
      {label}
      <input
        {...props}
        ref={ref}
        type={type}
        placeholder={placeholder}
        name={name}
        id={id}
        className={className}
      />
    </label>
  )
})

export default Input
export type { InputProps }
