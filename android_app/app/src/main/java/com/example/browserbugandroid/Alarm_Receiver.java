package com.example.browserbugandroid;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.util.Log;

import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;

import java.util.Random;

import static android.app.PendingIntent.getActivity;

public class Alarm_Receiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        Log.i("Alarm_Receiver.java", "========== alarm received ==========");
        String CHANNEL_ID = intent.getExtras().getString("chnl_id");
        String storedBbugName = intent.getExtras().getString("bbugName");
        int storedEmoji = intent.getExtras().getInt("emojiVal");
        int storedCapital = intent.getExtras().getInt("capitalVal");
        int storedPunct = intent.getExtras().getInt("punctVal");

        String myMessage = pickMessage(storedEmoji, storedCapital, storedPunct);

        // Build notification
        NotificationCompat.Builder builder = new NotificationCompat.Builder(context, CHANNEL_ID)
                .setSmallIcon(R.drawable.logo)
                .setContentTitle(storedBbugName+" says:")
                .setContentText(myMessage)
                .setPriority(NotificationCompat.PRIORITY_DEFAULT)
                .setCategory(NotificationCompat.CATEGORY_MESSAGE)
                //.setContentIntent(pendingIntent)
                .setAutoCancel(true); // automatically removes notification on tap

        // Send a notification
        NotificationManagerCompat notificationManager = NotificationManagerCompat.from(context);
        notificationManager.notify(100, builder.build()); // notificationId is a unique int for each notification that you must define
    }

    /*
     * Pick a message given texting style
     */
    private String pickMessage(int emoji, int capital, int punct) {
        final int EMOJI_BAR_SIZE = 4; // possible values for emojis: 0, 1, 2, 3
        final int CAPITAL_BAR_SIZE = 4;
        final int PUNCT_BAR_SIZE = 4;
        int randomNumber;

        String[] msgs ={"Don't forget to rest your eyes!", "How is your posture right now?", "Don't forget to drink water!",
                      "How are you doing?", "Smile!", "Take a break once in a while!"};
        String[] emojis ={" :)", " :D", " :3", " :P"};

        Random r = new Random();
        randomNumber = r.nextInt(msgs.length);
        String myMessage = msgs[randomNumber];

        // Add texting style

        if (capital == 0 || capital == 1) {
            myMessage = myMessage.toLowerCase();
        } else if (capital == CAPITAL_BAR_SIZE-1) {
            myMessage = myMessage.toUpperCase();
        }

        if (punct == 0 || punct == 1) {
            myMessage = myMessage.replaceAll("\\p{Punct}", "");
        } else if (punct == PUNCT_BAR_SIZE-1) {
            myMessage = myMessage.replaceAll("!", "!!");
            myMessage = myMessage.replaceAll("?", "??");
        }

        randomNumber = r.nextInt(EMOJI_BAR_SIZE-1);
        if (randomNumber < emoji) { // add an emoji
            randomNumber = r.nextInt(emojis.length);
            myMessage += emojis[randomNumber];
        }

        return myMessage;
    }
}
