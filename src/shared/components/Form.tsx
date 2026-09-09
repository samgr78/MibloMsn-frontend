import type {
  ComponentPropsWithoutRef,
  ReactElement,
  ReactNode,
} from 'react'

type FormProps = ComponentPropsWithoutRef<'form'> & {
  children: ReactNode
}

function Form({ children, ...formProps }: FormProps): ReactElement {
  return <form {...formProps}>{children}</form>
}

export default Form
export type { FormProps }
