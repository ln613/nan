import { todos } from './store/todos'
import { observer } from "mobx-react-lite"

const Todos = observer(({ todos }) => todos.all.map(t => 
  <div>
    {t.desc} - {t.keywords}
  </div>
))

export default () => 
  <>
    <Todos todos={todos} />
  </>