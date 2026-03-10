import { runAdd } from "./commands/add.tsx";
import { runList } from "./commands/list.tsx";
import { runDone } from "./commands/done.tsx";
import { runRemove } from "./commands/remove.tsx";
import { runEdit } from "./commands/edit.tsx";
import { runTui } from "./tui/App.tsx";
import { isValidDate } from "./store/types.ts";

const args = process.argv.slice(2);
const command = args[0];

function parseFlag(flag: string): string | undefined {
  const idx = args.indexOf(flag);
  if (idx !== -1 && idx + 1 < args.length) {
    return args[idx + 1];
  }
  return undefined;
}

function printUsage() {
  console.log(`Usage:
  todo                  Open interactive TUI
  todo tui              Open interactive TUI
  todo add "title"      Add a new todo
  todo add "title" --due YYYY-MM-DD
  todo list | ls        List all todos
  todo done <id>        Mark as done
  todo undo <id>        Mark as not done
  todo rm <id>          Remove a todo
  todo edit <id> "title"  Edit a todo's title`);
}

switch (command) {
  case undefined:
  case "tui":
    runTui();
    break;

  case "add": {
    const title = args[1];
    if (!title) {
      console.error('Usage: todo add "title" [--due YYYY-MM-DD]');
      process.exit(1);
    }
    const due = parseFlag("--due");
    if (due && !isValidDate(due)) {
      console.error(`Invalid date: "${due}". Use YYYY-MM-DD format.`);
      process.exit(1);
    }
    runAdd(title, due);
    break;
  }

  case "list":
  case "ls":
    runList();
    break;

  case "done":
  case "undo": {
    const id = args[1];
    if (!id) {
      console.error("Usage: todo done <id>");
      process.exit(1);
    }
    runDone(id);
    break;
  }

  case "rm": {
    const id = args[1];
    if (!id) {
      console.error("Usage: todo rm <id>");
      process.exit(1);
    }
    runRemove(id);
    break;
  }

  case "edit": {
    const id = args[1];
    const title = args[2];
    if (!id || !title) {
      console.error('Usage: todo edit <id> "new title"');
      process.exit(1);
    }
    runEdit(id, title);
    break;
  }

  default:
    console.error(`Unknown command: ${command}`);
    printUsage();
    process.exit(1);
}
