import { useContext } from "react";
import StreamClientContext from "../context/StreamClientContext";

export default function useStreamClient() {
  return useContext(StreamClientContext);
}



