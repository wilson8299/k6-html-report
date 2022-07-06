package command

import (
	"os/exec"

	"go.k6.io/k6/js/modules"
)

func init() {
	modules.Register("k6/x/command", new(Command))
}

type Command struct{}

func (*Command) Exec(name string, args []string) string {
	cmd := exec.Command(name, args...)
	out, _ := cmd.CombinedOutput()
	return string(out)
}
