package com.example.browserbugandroid;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Intent;
import android.os.Build;
import android.os.Bundle;
import android.os.SystemClock;
import android.util.Log;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.TextView;
import android.widget.Toast;

import android.app.AlarmManager;
import android.widget.Spinner;
import android.widget.Switch;
import android.widget.CompoundButton;
import android.content.Context;

import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;
import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;
import androidx.drawerlayout.widget.DrawerLayout;
import androidx.navigation.NavController;
import androidx.navigation.Navigation;
import androidx.navigation.ui.AppBarConfiguration;
import androidx.navigation.ui.NavigationUI;

import com.example.browserbugandroid.ui.login.LoginActivity;
import com.google.android.material.floatingactionbutton.FloatingActionButton;
import com.google.android.material.navigation.NavigationView;
import com.google.android.material.snackbar.Snackbar;

import java.util.Calendar;
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
        setContentView(R.layout.activity_studio);

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
        /*
        // Get the Intent that started this activity and extract the string
        Intent intent = getIntent();
        username = intent.getStringExtra(LoginActivity.USERNAME_MESSAGE);

        Toolbar toolbar = findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);
        FloatingActionButton fab = findViewById(R.id.fab);
        fab.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Snackbar.make(view, "Replace with your own action", Snackbar.LENGTH_LONG)
                        .setAction("Action", null).show();
            }
        });
        DrawerLayout drawer = findViewById(R.id.drawer_layout);
        NavigationView navigationView = findViewById(R.id.nav_view);
        // Passing each menu ID as a set of Ids because each
        // menu should be considered as top level destinations.
        mAppBarConfiguration = new AppBarConfiguration.Builder(
                R.id.nav_home, R.id.nav_my_account, R.id.nav_my_browserbugs, R.id.nav_studio, R.id.nav_options, R.id.nav_help, R.id.nav_support)
                .setDrawerLayout(drawer)
                .build();
        NavController navController = Navigation.findNavController(this, R.id.nav_host_fragment);
        NavigationUI.setupActionBarWithNavController(this, navController, mAppBarConfiguration);
        NavigationUI.setupWithNavController(navigationView, navController);

        // Set navigation header
        View header = navigationView.getHeaderView(0);
        TextView navHeaderTitle = header.findViewById(R.id.nav_header_title);
        TextView navHeaderText = header.findViewById(R.id.nav_header_text);
        navHeaderTitle.setText("Browserbee"); // TODO: change this to the name of their browserbug
        navHeaderText.setText(username);*/
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