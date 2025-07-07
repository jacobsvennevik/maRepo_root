import { z } from "zod"

const formSchema = z.object({
  email: z.email({ message: "Please enter a valid email address." }),
  password: z.string()
}); 