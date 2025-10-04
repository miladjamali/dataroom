import { useState } from 'react'
import { Button } from '@dataroom/ui'
import './index.css';

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <Button onClick={() => setCount(count + 1)}>
      Count is {count}
    </Button>
    </>
  )
}

export default App
