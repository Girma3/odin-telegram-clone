import {
  privateMessageSchema,
  groupMessageSchema,
  reactionSchema,
} from "../schemas/messageSchema.js";

const validators = {
  private_chat: privateMessageSchema,
  group_message: groupMessageSchema,
  reaction_add: reactionSchema,
  reaction_remove: reactionSchema,
};

function schemaValidationMiddleware(ws, type, payload) {
  const schema = validators[type];
  if (!schema) return; // no schema defined for this event

  const result = schema.safeParse(payload);
  if (!result.success) {
    ws.send(
      JSON.stringify({
        type: "error",
        message: "Invalid payload",
        details: result.error.format(),
      }),
    );
    return false; // block event
  }
}
export { schemaValidationMiddleware };
