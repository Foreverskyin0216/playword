import { Annotation, MemorySaver, StateGraph, messagesStateReducer } from '@langchain/langgraph'

export const generateStrategyGraph = () => {
  const annotation = Annotation.Root({ messages: Annotation({ reducer: messagesStateReducer }) })
  const checkpointer = new MemorySaver()

  const strategyGraph = new StateGraph(annotation)

  return strategyGraph.compile({ checkpointer })
}
