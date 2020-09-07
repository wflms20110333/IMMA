package com.example.browserbugandroid;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Intent;
import android.os.Build;
import android.os.Bundle;
import android.os.SystemClock;
import android.util.Log;
import android.widget.ArrayAdapter;
import android.widget.TextView;

import android.app.AlarmManager;
import android.widget.Spinner;
import android.widget.Switch;
import android.widget.CompoundButton;
import android.content.Context;

import androidx.appcompat.app.AppCompatActivity;
import androidx.navigation.ui.AppBarConfiguration;

import java.util.Hashtable;

// Notification imports

public class NotifActivity extends AppCompatActivity {

    private AppBarConfiguration mAppBarConfiguration;
    private String username;

    // to make an alarm manager
    AlarmManager alarm_manager;
    Spinner freq_picker;
    TextView bbug_name;
    Switch activation_switch;
    Context context;
    PendingIntent pending_intent;
    final String CHANNEL_ID = "bbugChannel";

    // temporarily store dictionary for spinner labels -> milliseconds
    Hashtable<String, Integer> spinner_dict = new Hashtable<String, Integer>();

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_notifpage);

        spinner_dict.put("10 seconds", 10000);
        spinner_dict.put("1 minute", 60000);
        spinner_dict.put("15 minutes", 900000);
        spinner_dict.put("30 minutes", 1800000);
        spinner_dict.put("1 hour", 3600000);
        spinner_dict.put("2 hours", 7200000);

        Log.i("NotifActivity.java", "========== notif activity started ==========");

        // Initialize variables
        this.context = this;
        alarm_manager = (AlarmManager) getSystemService(ALARM_SERVICE); // initialize alarm manager
        freq_picker = (Spinner) findViewById(R.id.msgFreqSpinner); // initialize frequency picker
        bbug_name = (TextView) findViewById(R.id.bbugName); // initialize character label
        activation_switch = (Switch) findViewById(R.id.activationSwitch); // initialize switch

        Log.i("NotifActivity.java", "=================== still ok so far");

        // populate menu of the spinner
        ArrayAdapter<CharSequence> adapter = ArrayAdapter.createFromResource(this, R.array.freqtimes, android.R.layout.simple_spinner_item);
        adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        freq_picker.setAdapter(adapter);
        freq_picker.setSelection(0);
        //freq_picker.setOnItemSelectedListener(this);

        // Create NotificationChannel, only on API 26+ bc class is new, not in support library
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            CharSequence name = getString(R.string.channel_name);
            String description = getString(R.string.channel_description);
            int importance = NotificationManager.IMPORTANCE_DEFAULT;
            NotificationChannel channel = new NotificationChannel(CHANNEL_ID, name, importance);
            channel.setDescription(description);
            // Register the channel with the system; you can't change the importance
            // or other notification behaviors after this
            NotificationManager notificationManager = getSystemService(NotificationManager.class);
            notificationManager.createNotificationChannel(channel);
        }

        // listeners
        // #TODO spinner listener
        activation_switch.setOnCheckedChangeListener(new CompoundButton.OnCheckedChangeListener() {
            @Override
            public void onCheckedChanged(CompoundButton buttonView, boolean isChecked){
                Log.i("NotifActivity.java", "========== switch switched ==========");
                if (isChecked) {
                    activateAlarms();
                } else {
                    // inactivate alarm
                    alarm_manager.cancel(pending_intent);
                }
            }
        });
    }

    private void activateAlarms() {
        // #TODO start alarms after restart https://developer.android.com/training/scheduling/alarms#boot
        Log.i("NotifActivity.java", "========== setting alarm ==========");

        //String CHANNEL_ID = "bbugChannel";

        // create intent to the Alarm Receiver class
        final Intent my_intent = new Intent(this.context, Alarm_Receiver.class);
        my_intent.putExtra("chnl_id", CHANNEL_ID);

        // get frequency of notifications from the spinner
        String freq_of_notif = freq_picker.getSelectedItem().toString();
        Integer freq_in_ms = spinner_dict.get(freq_of_notif);
        Log.i("NotifActivity.java", "Selecting notification frequency of " + String.valueOf(freq_in_ms) + "ms");

        pending_intent = PendingIntent.getBroadcast(context, 0,
                my_intent, PendingIntent.FLAG_UPDATE_CURRENT);

        alarm_manager.setRepeating(AlarmManager.ELAPSED_REALTIME_WAKEUP,
                SystemClock.elapsedRealtime() + 1000,
                freq_in_ms, pending_intent);
    }

}