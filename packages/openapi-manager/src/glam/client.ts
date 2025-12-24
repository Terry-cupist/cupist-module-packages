import { createOpenApiClientModule } from "@/core";
import { client } from "./generated/client.gen";

export const glamClient = createOpenApiClientModule<typeof client>({ client });
