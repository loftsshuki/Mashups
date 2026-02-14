import { redirect } from "next/navigation"

export default function AIMashupRedirect() {
  redirect("/create?mode=auto")
}
