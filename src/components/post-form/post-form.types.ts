export interface PostFormProps
  extends Omit<React.ComponentProps<'form'>, 'onSubmit'> {
  onSuccess?: () => void;
}
