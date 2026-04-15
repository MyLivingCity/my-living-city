# flake.nix - Nix Flake configuration file
# This file defines a reproducible development environment using Nix flakes
# Documentation: https://nixos.wiki/wiki/Flakes
{
  description = "MyLivingCity Project environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs =
    {
      self,
      nixpkgs,
      flake-utils,
    }:
    # This function creates outputs for each system (x86_64-linux, aarch64-darwin, etc.)
    flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = import nixpkgs {
          system = "x86_64-linux";
          config.allowUnfreePredicate =
            pkg:
            builtins.elem (nixpkgs.lib.getName pkg) [
            ];
        };
      in
      {
        devShells.default = pkgs.mkShell {
          name = "MLC";
          nativeBuildInputs = with pkgs; [ zsh ];

          buildInputs = with pkgs; [
            # Libs and shared objects
            gmp
          ];

          shellHook = ''
            export LD_LIBRARY_PATH=${pkgs.lib.makeLibraryPath (with pkgs; [ gmp ])}:$LD_LIBRARY_PATH
          '';
        };
      }
    );
}
