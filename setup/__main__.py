"""Enable `python -m setup` invocation."""
from setup.cli import main
import sys

if __name__ == "__main__":
    sys.exit(main())
