export SIZE=48
echo "ffmpeg -i icon.png -vf scale=$SIZE:$SIZE ${SIZE}x${SIZE}.png" | bash
