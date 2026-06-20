import { redirect } from "next/navigation"

export default function HomePage() {
  redirect("/v1/blog")
}
