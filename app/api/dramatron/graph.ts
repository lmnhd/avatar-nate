import { ChatAnthropic } from "@langchain/anthropic";
import { StateGraph } from "@langchain/langgraph";
import { Story } from "./entities"; 
import { Prefixes } from "./prefixes/types";
import { StoryGenerator } from "./story_generator";
import { RunnableConfig} from "@langchain/core/runnables"


const LOG_LINE = "Folk tale ablut a rabbit, a fox and a crow living in an enchanted forest. The cunning animals safegaurd the golden apple tree from a greedy lummberjack and conspire to teach him a lesson. The animals are rewarded with a feast of golden apples and the lumberjack learns a valuable lesson about greed and the importance of nature. The animals are rewarded with a feast of golden apples and the lumberjack learns a valuable lesson about greed and the importance of nature. The animals are rewarded with a feast of golden apples and the lumberjack learns a valuable lesson about greed and the importance of nature. The animals are rewarded with a feast of golden apples and the lumberjack learns a valuable lesson about greed and the importance of nature. The animals are rewarded with a feast of golden apples and the lumberjack learns a valuable lesson about greed and the importance of nature. The animals are rewarded with a feast of golden apples and the lumberjack learns a valuable lesson about greed and the importance of nature. The animals are rewarded with a feast of golden apples and the lumberjack learns a valuable lesson about greed and the importance of nature. The animals are rewarded with a feast of golden apples and the lumberjack learns a valuable lesson about greed and the importance of nature. The animals are rewarded with a feast of golden apples and the lumberjack learns a valuable lesson about greed and the importance of nature.";

type GraphState = {
  logLine: string;
  prefixes: Prefixes;
  level: number;

  generator: StoryGenerator | null;
  story: Story | null;
}

const graphState = {
  logLine: {
    value: null,
  },
  prefixes: {
    value: null,
  },
  level: {
    value: null,
  },
  generator: {
    value: null,
  },
  story: {
    value: null,
  }

}




export async function graph() {
  const workFlow = new StateGraph<GraphState>({
    channels: graphState
  })

  const llm = new ChatAnthropic({
    modelName: "claude-3-sonnet-20240229",
    temperature: 0,
  });

  const initializerNode =  (state: GraphState): Partial<GraphState> => {
    const generator = new StoryGenerator({
      llm,
      storyline: state.logLine,
      prefixes: state.prefixes
    })
    return {
      generator
    }
  }

  const generatorNode = async (state: GraphState, config?: RunnableConfig): Promise<Partial<GraphState>> => {
    const { generator } = state;
    if (!generator) {
      throw new Error("Generator not initialized");
    }

    const success = await generator.step(state.level, undefined, undefined, config);

    if (success){
      return { level: state.level + 1 }
    }else{
      return { level: state.level}
    }
  }

  const shouldContinueNode = (state: GraphState) => {
    const { level } = state;
    if (level >= 5) {
      return "render_node"
    }
    return "generator_node"
  }

  const renderNode = (state: GraphState) => {
    const { generator } = state;
    if (!generator) {
      throw new Error("Generator not initialized");
    }
    const story = generator.getStory();
    return { story }
  }


  workFlow.addNode("initializer_node", initializerNode);
  workFlow.addNode("generator_node", generatorNode);
  workFlow.addNode("render_node", renderNode);

  workFlow.setEntryPoint("initializer_node");
  workFlow.addEdge("initializer_node", "generator_node");

  workFlow.addConditionalEdges("generator_node", shouldContinueNode)

  workFlow.setFinishPoint("render_node");
}
