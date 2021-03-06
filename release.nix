{ src ? builtins.fetchGit { url = ./.; submodules = true; }
, supportedSystems ? [ builtins.currentSystem ]
}:
let
  sources = import nix/sources.nix;
  lib = import (sources.nixpkgs + "/lib");
in
{
  mantisWallet = lib.genAttrs supportedSystems (system: import src {
    inherit src system;
  });
}
