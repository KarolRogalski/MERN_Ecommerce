export default function MessageBox(props) {
  return (
    <div
      className={props.variant ? `messageBox ${props.variant}` : 'messageBox'}
    >
      {props.children}
    </div>
  )
}
