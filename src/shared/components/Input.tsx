import type {
  ComponentPropsWithoutRef,
  HTMLInputTypeAttribute,
  ReactElement,
} from 'react'

type InputProps = ComponentPropsWithoutRef<'input'> & {
  type?: HTMLInputTypeAttribute
  placeholder?: string
  name?: string
  id?: string
  className?: string
  label: string
}

function Input({
  type = 'text',
  label,
  placeholder,
  name,
  id,
  className,
  ...props
}: InputProps): ReactElement {
  return (
    <label>
      {label}
      <input
        {...props}
        type={type}
        placeholder={placeholder}
        name={name}
        id={id}
        className={className}
      />
    </label>
  )
}

export default Input
export type { InputProps }
